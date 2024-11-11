type FunctionType<T> = (...args: any[]) => Promise<{ data: T }>;

type ObjectType<T> = {
  [key in keyof T]: FunctionType<T[key]>;
};


export const typedApiWrapper = <T>(obj: ObjectType<T>) => {
  let newObj: ObjectType<T> = {} as ObjectType<T>;
  for (const key in obj) {
    // @ts-ignore
    newObj[key] = typedApi(obj[key]);
  }
  return newObj;
};

export const typedApi = <T>(fn: FunctionType<T>) => {
  // @ts-ignore
  return async (args: any) => {
    const typeName = fn.name;

    try {
      const bodys = await fn(args);
      if (bodys) {
        // prevent close calls, causes ts-morph to throw an error if the same file is saved multiple times
        let data;
        if (bodys instanceof Promise) {
            // @ts-ignore
            data = await bodys?.json();
        } else {
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
      return bodys;
    } catch (error) {
      console.log('\n\n\nError\n\n\n\n', error);
      return error;
    }
  };
};
