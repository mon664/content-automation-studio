import React from 'react';
import Layout from '@/components/Layout';
import AutoVideoGeneration from '@/components/AutoVideoGeneration';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <AutoVideoGeneration />
    </Layout>
  );
};

export default HomePage;