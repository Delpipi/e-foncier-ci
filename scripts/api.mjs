//json data
const urljson = "../data/land_data.json";


//Get Land Data
export async function getLandDataList() {
    try {
        const response = await fetch(urljson);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw Error(await response.text());
        }
    } catch (error) {
        console.error(error);
    }
}

export function getMillisecondsInDay() {
    return 1000 * 60 * 60 * 24;
}