export const loader = () => {
  // handle "GET" request
  // set up our text content that will be returned in the response
  const walletconnect = `7ec5a112-551e-4ed3-9dd2-92c0e7dbd32a=b31c361ebeff7f8f8421c35e05ea57adebcf9b01cb627bbb3f858df0cfd90ba0`;
  // return the text content, a status 200 success response, and set the content type to text/plain
  return new Response(walletconnect, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
