import React from 'react';
import LandscapeTest from '../components/LandscapeTest';
import Head from 'next/head';

/**
 * Stránka pro testování responzivity a orientace v landscape módu
 * Tato stránka umožňuje simulovat různé typy zařízení a sledovat, jak se aplikace chová
 * v landscape režimu na těchto zařízeních
 */
const LandscapeTestPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Test zobrazení v landscape módu</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="Testovací stránka pro landscape režim na mobilních zařízeních" />
      </Head>
      <LandscapeTest />
    </>
  );
};

export default LandscapeTestPage;
