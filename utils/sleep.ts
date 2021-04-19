export default async function sleep(ms: number){
    return new Promise(((resolve, reject) => {
        setTimeout(function(){
            resolve(true);
        }, ms)
    }))
}
