import React, { createContext, useReducer, useContext } from 'react';

const actionHandler = (state,action)=>{
    let temp;  
    switch(action.type)
    {
        case 'FETCH' : temp = [];
                     temp = temp.concat(action.data)
                     temp.sort((a,b)=>{
                      return new Date(a.current_time).getTime()- new Date(b.current_time).getTime()
                     })
                     temp.slice(temp.length-1000,temp.length)
              
                     return temp;
        case 'FILTER' : temp = [...state];
                         console.log(temp,state)
                        temp = temp.filter((ele)=>{
                          return new Date(ele.current_time).getTime() <= action.date.getTime();
                        })
                        temp.sort((a,b)=>{
                          return new Date(a.current_time).getTime()- new Date(b.current_time).getTime()
                         })
                        return temp;
        
                     default:
                            temp = [...state];
        return  temp;
    }

}

const DataContext = createContext();
const CounterProvider= ({ children }) => {
    const [dataPoints, dispatch] = useReducer(actionHandler, []);
  
    return (
      <DataContext.Provider value={{ dataPoints, dispatch }}>
        {children}
      </DataContext.Provider>
    );
  };
  
  const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
      throw new Error('useCounter must be used within a CounterProvider');
    }
    return context;
  };
  
  export {CounterProvider,useDataContext}