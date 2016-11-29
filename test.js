var test = () => {
    return new Promise((resolve, reject) => {
       reject('errr', 'abc'); 
    });
};
test().catch((e, b) => {
    console.log(e, b);
});