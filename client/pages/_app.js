import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/buildClient";
import Header from "../components/Header";
import { useEffect } from "react";

const app = ({ Component, pageProps }) => {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return (
    <>
      <Header {...pageProps} />
      <Component {...pageProps} />
    </>
  );
};

app.getInitialProps = async ({ Component, ctx }) => {
  let pageProp = {};
  let result = {};
  try {
    const { data } = await buildClient(ctx).get("/api/users/currentuser");
    result = data ? data : result;
  } catch (err) {
    console.log(err);
  }
  if (Component.getInitialProps)
    pageProp = await Component.getInitialProps(ctx);
  return { pageProps: { ...result, ...pageProp } };
};

export default app;
