const { checkForAdminKey } = require("./express-util");

const check = (x, props) => {
    if (x === undefined || x === null)
        throw new Error(`Variable is not valid.`)

    if (props !== undefined) {
        props.forEach(p => {
            if(!x.hasOwnProperty(p))
            check(x[p])
        });
    }
}

module.exports = { check }