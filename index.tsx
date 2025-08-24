/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";

// Ensure the API key is available in the environment variables
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const firstNameInput = document.getElementById('first-name') as HTMLInputElement;
const lastNameInput = document.getElementById('last-name') as HTMLInputElement;
const urlInput = document.getElementById('tiktok-url') as HTMLInputElement;
const analyzeButton = document.getElementById('analyze-button') as HTMLButtonElement;
const resultContainer = document.getElementById('result-container') as HTMLElement;

const setLoading = (isLoading: boolean) => {
    if (isLoading) {
        analyzeButton.disabled = true;
        analyzeButton.textContent = 'Analizē...';
        resultContainer.innerHTML = '<div class="loader"></div>';
        resultContainer.classList.remove('has-content');
    } else {
        analyzeButton.disabled = false;
        analyzeButton.textContent = 'Analizēt';
    }
};

const displayResult = (content: string) => {
    // Sanitize and parse the markdown content to HTML
    const htmlContent = marked.parse(content);
    resultContainer.innerHTML = htmlContent as string;
    resultContainer.classList.add('has-content');
};

const displayError = (message: string) => {
    resultContainer.innerHTML = '';
    resultContainer.classList.add('has-content');
    const errorElement = document.createElement('p');
    errorElement.className = 'error';
    errorElement.textContent = message;
    resultContainer.appendChild(errorElement);
};

const analyzeProfile = async () => {
    const tiktokUrl = urlInput.value.trim();
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();

    if (!tiktokUrl || !tiktokUrl.includes('tiktok.com')) {
        displayError('Lūdzu, ievadiet derīgu TikTok profila URL.');
        return;
    }

    setLoading(true);

    const prompt = `Lūdzu, veic padziļinātu analīzi par TikTok profilu: ${tiktokUrl}.
Ja ir zināms, personas vārds ir ${firstName} ${lastName}. Ja vārds nav dots, mēģini to noskaidrot no profila.

**Analīzes uzdevumi:**
1.  **TikTok profila saturs:** Izpēti publiski pieejamo informāciju (bio, video tēmas, apraksti, komentāri).
2.  **Propagandas pārbaude:** Pievērs īpašu uzmanību, vai saturs atbilst Kremļa propagandai vai izplata Krievijas naratīvus. Esi objektīvs un pamato savus secinājumus ar piemēriem no profila, ja tādus atrodi.
3.  **Papildu informācijas meklēšana:** Izmantojot personas vārdu (ja zināms vai noskaidrots) un lietotājvārdu, meklē informāciju par šo personu Google un citās publiskās platformās (sociālie tīkli, ziņu raksti).
4.  **Strukturēts ziņojums:** Sagatavo atbildi latviešu valodā, izmantojot sekojošu Markdown struktūru:

### **Padziļinātā profila analīze**

**1. Kopsavilkums:**
[Īss kopsavilkums par konta saturu, tā mērķauditoriju un galveno vēstījumu.]

**2. Galvenās tēmas:**
*   [Tēma 1]
*   [Tēma 2]
*   [Tēma 3 vai vairāk]

**3. Autora profils (pēc TikTok datiem):**
[Apraksts par personas iespējamo nodarbošanos, aizraušanos vai raksturojumu, kas izriet TIKAI no TikTok satura.]

**4. Pārbaude par propagandu:**
**Secinājums:** [Skaidrs secinājums: "Nav novērotas pazīmes", "Iespējamas pazīmes", "Skaidri redzamas pazīmes".]
**Pamatojums:** [Detalizēts paskaidrojums un piemēri, ja pazīmes ir atrastas. Ja nav, tad "Profila saturā netika atrastas pazīmes, kas liecinātu par Kremļa propagandas izplatīšanu."]

**5. Papildu informācija (no citiem avotiem):**
[Informācija, kas atrasta par personu ārpus TikTok. Ja nekas nav atrasts, norādi to: "Ārpus TikTok platformas publiski pieejama informācija par šo personu netika atrasta."]`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        displayResult(response.text);

    } catch (error) {
        console.error('Error analyzing profile:', error);
        displayError('Radās kļūda, veicot analīzi. Lūdzu, mēģiniet vēlāk.');
    } finally {
        setLoading(false);
    }
};

analyzeButton.addEventListener('click', analyzeProfile);
urlInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        analyzeProfile();
    }
});
firstNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        analyzeProfile();
    }
});
lastNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        analyzeProfile();
    }
});
