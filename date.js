//

exports.getDate = function() {

    let today = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }

    return today.toLocaleDateString(undefined, options); 
}

