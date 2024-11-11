type FunctionType<T, U> = (...args: U[]) => Promise<T>;

type ObjectType<T, U> = {
  [key in keyof T]: FunctionType<T[key], U>;
};


export const typedApiWrapper = <T, U>(obj: ObjectType<T, U>) => {
  let newObj: ObjectType<T, U> = {} as ObjectType<T, U>;
  for (const key in obj) {
    // @ts-ignore
    newObj[key] = typedApi(obj[key]);
  }
  return newObj;
};

export const typedApi = <T, U>(fn: FunctionType<T, U>) => {
  // @ts-ignore
  return async (args: U) => {
    const typeName = fn.name;

    let data;

    try {
      const bodys = await fn(args);
      if (bodys) {
        // prevent close calls, causes ts-morph to throw an error if the same file is saved multiple times
        if (bodys instanceof Promise) {
            // @ts-ignore
            data = await bodys?.json();
        } else {
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
            })
          }, 1000);
        
      }
      return data;
    } catch (error) {
      return error;
    }
  };
};

