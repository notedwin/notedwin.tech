import Layout from "../components/layout";
import Navbar from "../components/navbar";
import About from "../components/about";
import React from 'react'

export default function ResumePage() {
  return (
    <Layout>
      <Navbar />
      <About/>
    </Layout>
  );
}