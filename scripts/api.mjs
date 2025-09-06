//json data
const urljson = "../data/land_data.json";
const urljsonExpert = "../data/experts_data.json";


//Get Land Data
export async function getLandDataList() {
    try {
        //Simulate API Call
        await new Promise(resolve => setTimeout(resolve, 2000));

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

//Get Expert Data
export async function getExpertDataList() {
    try {
        //Simulate API Call
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await fetch(urljsonExpert);
        if (response.ok) {
            const data = response.json();
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