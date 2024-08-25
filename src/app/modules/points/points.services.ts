
const makePoints = async (ratting: number, userT: string) => {

    let point = 0

    if (ratting >= 3) {
        if (userT === "Gold" || "Trial") {
            point = 5

        } else if (userT === "Platinum") {
            point = 25
        }
        else if (userT === "Diamond") {
            point = 50
        }
    }

    if (ratting < 3) {
        if (userT === "Gold" || "Trial") {
            point = 10

        } else if (userT === "Platinum") {
            point = 25
        }
        else if (userT === "Diamond") {
            point = 50
        }

    }

    return point
};


export {
    makePoints
};