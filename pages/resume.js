import Layout from "../components/layout";
import Head from "next/head";
import Navbar from "../components/navbar";
import Resume from "../components/resume"


export default function ResumePage() {
  return (
    <Layout>
      <Head>
        <title>Edwin Zamudio</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Resume/>
    </Layout>
  );
}