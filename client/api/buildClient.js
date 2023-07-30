import axios from "axios";
//create custom axios client with the appropriate baseURL and headers
export default function ({ req }) {
  if (typeof window === "undefined") {
    //on the server

    // set base url to send request through ingress-nginx
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers, // include header of request object to pass cookie through
    });
  } else {
    //on the client
    return axios.create({
      baseURL: "/", //no need for rerouting. cookie is automatically added
    });
  }
}
