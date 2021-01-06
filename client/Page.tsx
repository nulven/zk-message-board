import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';

const defaultTitle = 'Shopify';

interface Props {
  path: string;
  Subpage: any;
};

export const Page = (props: Props) => {
  const { path, Subpage } = props;
  useEffect(() => {
    if (document) {
      const title = path;
      const titleType = typeof title;
      document.title = title;
    }
  }, [path]);

  return (
    <Route
      path={path}
      render={(props: any) => (
        <>
          <Subpage {...props} />
        </>
      )}
    />
  );
};
