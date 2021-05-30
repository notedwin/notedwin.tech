import "../styles/main.scss";
import React from 'react';
import { library, config, dom } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";


import { Container,MoreStories,HeroPost,Hero,Layout,Navbar } from '@components';

library.add(fas, fab);
config.autoAddCss = false;

export default function Index() {
  return (
    <Layout>
      <Navbar />
      <Hero />
      <Container>
      </Container>
    </Layout>
  );
}