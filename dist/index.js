export const typedApiWrapper = (obj) => {
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
export const typedApi = (fn) => {
    return async (...args) => {
        const typeName = fn.name;
        let data;
        try {
            const bodys = await fn(...args);
            if (bodys) {
                if (bodys instanceof Promise) {
                    // @ts-ignore
                    data = await bodys?.json();
                }
                else {
                    // @ts-ignore
                    data = bodys?.data || bodys;
                }
                setTimeout(() => {
                    fetch(`http://localhost:4000/`, {
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
            return data;
        }
        catch (error) {
            return error;
        }
    };
};
