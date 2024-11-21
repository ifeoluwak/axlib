type FunctionType<T> = (...args: any[]) => Promise<T>;

type ObjectType<T> = {
  [key in keyof T]: FunctionType<T[key]>;
};

const typedApiWrapper = <T>(obj: ObjectType<T>) => {
  let newObj: ObjectType<T> = {} as ObjectType<T>;
  for (const key in obj) {
    if (typeof obj[key] === 'function') {
      newObj[key] = typedApi(obj[key]);
    } else {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

const typedApi = <T>(fn: FunctionType<T>) => {
  return async (...args: any[]) => {
    const typeName = fn.name;

    let data;

    try {
      const bodys = await fn(...args);
      if (bodys) {
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

export { typedApiWrapper };