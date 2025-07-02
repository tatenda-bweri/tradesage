import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';

import MainLayout from '@/components/layout/main-layout';
import { RichTextEditor, Card, Button } from '@/components/ui';

const RichTextEditorTestPage = () => {
  const [content, setContent] = useState('');
  
  const handleSave = () => {
    console.log('Content to save:', content);
    alert('Content saved to console!');
  };
  
  return (
    <>
      <Head>
        <title>Rich Text Editor Test | TradeSage</title>
        <meta name="description" content="Testing the rich text editor component" />
      </Head>
      
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Rich Text Editor Test</h1>
          
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Basic Editor</h2>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start typing here..."
              showCharCount
              maxLength={500}
            />
            
            <div className="mt-4">
              <Button onClick={handleSave}>Save Content</Button>
            </div>
          </Card>
          
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div 
              className="p-4 border border-surface-light rounded-lg bg-surface"
              dangerouslySetInnerHTML={{ __html: content || '<p class="text-text-secondary">No content yet.</p>' }}
            />
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Raw HTML</h2>
            <pre className="p-4 bg-surface-dark rounded-lg overflow-auto text-sm font-mono">
              {content || '<p>No content yet.</p>'}
            </pre>
          </Card>
        </div>
      </MainLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }
  
  return {
    props: {
      session,
    },
  };
};

export default RichTextEditorTestPage;
