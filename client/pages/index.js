const index = ({ currentUser }) => {
  return (
    <>
      {currentUser ? (
        <h1>Hello {currentUser.email}</h1>
      ) : (
        <h1>Hello... anonymous??</h1>
      )}
      ;
    </>
  );
};

export default index;
