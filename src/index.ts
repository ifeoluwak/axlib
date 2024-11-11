type FunctionType<T, U extends Parameters<any>> = (...args: U) => Promise<T>;

type ObjectType<T, U extends Parameters<any>> = {
  [key in keyof T]: FunctionType<T[key], U>;
};


export const typedApiWrapper = <T, U extends Parameters<any>>(obj: ObjectType<T, U>) => {
  let newObj: ObjectType<T, U> = {} as ObjectType<T, U>;
  for (const key in obj) {
    // @ts-ignore
    newObj[key] = typedApi(obj[key]);
  }
  return newObj;
};

export const typedApi = <T, U extends Parameters<any>>(fn: FunctionType<T, U>) => {
  if (typeof fn !== 'function') {
    return fn;
  }
  // @ts-ignore
  return async (...args: U) => {
    const typeName = fn.name;

    let data;

    try {
      const bodys = await fn(...args);
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




// const getExerciseById = (id: string, age: number) => fetch(`https://wger.de/api/v2/exercise/${id}/${age}`)

// const ghj = typedApi(getExerciseById);

// ghj('23', 23).then(console.log)