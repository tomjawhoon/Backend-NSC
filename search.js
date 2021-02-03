function calReturn(path, m) {
    return path.reduce((prev, cur, index) => {
        if (index === 0 && index === path.length - 1) {
            return m[0][cur] * m[cur][0];
        } else if (index === 0) {
            return m[0][cur];
        } else if (index === path.length - 1) {
            return prev * m[path[index - 1]][cur] * m[cur][0];
        } else {
            return prev * m[path[index - 1]][cur];
        }
    }, 0);
}

function getRouteStr(path, names) {
    return path.reduce((prev, cur, index) => {
        if (index === 0 && index === path.length - 1) {
            return `${names[0]} -> ${names[cur]} -> ${names[0]}`;
        } else if (index === 0) {
            return `${names[0]} -> ${names[cur]} -> `;
        } else if (index === path.length - 1) {
            return prev + `${names[cur]} -> ${names[0]}`;
        } else {
            return prev + `${names[cur]} -> `;
        }
    }, '');
}

module.exports = (priceMatrix, names) => {

    function search(selected, next) {

        let merged = selected ? [...selected, next] : [];

        let price = selected ? calReturn(merged, priceMatrix) : 0;
        let route = selected ? getRouteStr(merged, names) : [];

        let revenue = price;
        let bestRoute = route;

        selected && console.log({ revenue, bestRoute }); // คืออะไรวะเนี่ย

        if (!selected || selected.length < priceMatrix.length - 2) {
            for (let i = 1; i < priceMatrix.length; i++) {
                if (next !== i && !merged.includes(i)) {
                    let res = search(merged, i);
                    if (res.revenue > revenue) {
                        revenue = res.revenue;
                        bestRoute = res.bestRoute;
                    }
                }
            }
        }

        return { revenue, bestRoute }
    }

    return search();
}