import Layout from "../components/layout";
import Navbar from "../components/navbar";

export default function Repairs() {
  return (
    <Layout>
      <Navbar />
      <p>
        Hello, This is the main webpage for Edwin's Electronic repair. A list of
        services I provide.
      </p>
      <ul>
        <i>Phone Repairs</i>
        <i>Laptop Repairs</i>
        <i>PC building</i>
      </ul>
      <p>
        The price for any service is on a case by case basis. I can give an
        estimate once I have enough details. I am currently taking requests by
        phone number only. I also only do drop off requests, no pick ups.
        (815)-793-6917
      </p>
    </Layout>
  );
}