const typedApiWrapper = (obj) => {
    let newObj = {};
    for (const key in obj) {
        if (typeof obj[key] === 'function') {
            newObj[key] = typedApi(obj[key]);
        }
        else {
            newObj[key] = obj[key];
        }
    }
    return newObj;
};
const typedApi = (fn) => {
    return async (...args) => {
        const typeName = fn.name;
        let data;
        let isFetch = false;
        try {
            const response = await fn(...args);
            if (response) {
                // means this is a fetch request
                if (response instanceof Promise) {
                    isFetch = true;
                    // fetch request does not throw error on 404, so we need to handle it
                    // @ts-ignore
                    if (!response.ok) {
                        // @ts-ignore
                        throw new Error(response);
                    }
                    // @ts-ignore
                    data = await response?.json();
                }
                else {
                    // @ts-ignore
                    data = response?.data || response;
                }
                setTimeout(() => {
                    fetch(`http://localhost:4141/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: typeName,
                            data: data,
                        }),
                    });
                }, 1000);
            }
            return isFetch ? data : response;
        }
        catch (error) {
            return error;
        }
    };
};
export { typedApiWrapper };
