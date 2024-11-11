export const typedApiWrapper = (obj) => {
    let newObj = {};
    for (const key in obj) {
        // @ts-ignore
        newObj[key] = typedApi(obj[key]);
    }
    return newObj;
};
export const typedApi = (fn) => {
    // @ts-ignore
    return async (args) => {
        const typeName = fn.name;
        try {
            const bodys = await fn(args);
            if (bodys) {
                // prevent close calls, causes ts-morph to throw an error if the same file is saved multiple times
                let data;
                if (bodys instanceof Promise) {
                    // @ts-ignore
                    data = await bodys?.json();
                }
                else {
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
            return bodys;
        }
        catch (error) {
            console.log('\n\n\nError\n\n\n\n', error);
            return error;
        }
    };
};
