import Layout from "../components/layout";
import Head from "next/head";
import Navbar from "../components/navbar";
import About from "../components/about";

export default function ResumePage() {
  return (
    <Layout>
      <Head>
        <title>Edwin Zamudio</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <About/>
    </Layout>
  );
}