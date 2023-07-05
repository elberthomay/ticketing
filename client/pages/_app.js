import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/buildClient";
import Header from "../components/Header";

const app = ({ Component, pageProps }) => {
  return (
    <>
      <Header {...pageProps} />
      <Component {...pageProps} />
    </>
  );
};

app.getInitialProps = async ({ Component, ctx: { req } }) => {
  try {
    const { data } = await buildClient({ req }).get("/api/users/currentuser");
    let pageProp = {};
    if (Component.getInitialProps)
      pageProp = await Component.getInitialProps({ req });
    return { pageProps: { ...data, ...pageProp } };
  } catch (err) {
    console.log(err);
  }
};

export default app;
