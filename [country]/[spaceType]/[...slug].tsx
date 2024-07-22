/* eslint-disable no-console */
import React, { memo, useEffect } from 'react';
import type { NextPage } from 'next';
import readListingPageData from '@/application/services/readListingPageData';
import { PageType } from '@/application/enums';
import readCentrePageData from '@/application/services/readCentrePageData';
import { ListingPage404Props, ListingPageProps } from '@/components/layout/listing/listing.types';
import { CentrePageProps } from '@/components/layout/centre/centre.types';
import ListingPage from '@/components/layout/listing/ListingPageLayout/ListingPageLayout';
import CentrePage from '@/components/layout/centre/CentrePageLayout/CentrePageLayout';
import { PageContext, Redirect } from '@/components/common/common.types';
import { getPageDataFromContext } from '@/helpers/getPageDataFromContext';
import { checkIfUrlHaveDuplicatedCountryCode, getRedirectUrlForCombinedCentrePages } from '@/helpers/redirects';
import getServerSidePropsWithError from '@/helpers/getServerSidePropsWithError';
import ListingPage404Layout from '@/components/layout/listing/ListingPage404Layout/ListingPage404Layout';
import Locations from '@/components/layout/coworkingSpace/locations/Locations';
import { LocationsPageProps } from '@/components/layout/coworkingSpace/locations/locations.types';
import readLocationsPageData from '@/application/services/readLocationsPageData';
import locations from '@/helpers/locationsWithTranslations';

interface GonePageProps {
  pageType: PageType.Gone410;
  message: string;
}

// const ListingCentrePage: NextPage<ListingPageProps |
// ListingPage404Props |
// CentrePageProps |
// LocationsPageProps |
// GonePageProps>

const ListingCentrePage: NextPage<any> = (props) => {
  const { pageType } = props;
  useEffect(() => {
    document.body.setAttribute('page', pageType);
  }, [pageType]);

  const renderPageContent = () => {
    switch (pageType) {
      case PageType.Centre:
        return <CentrePage {...props} />;
      case PageType.Listing:
        return <ListingPage {...props} />;
      case PageType.Listing404:
        return <ListingPage404Layout {...props} />;
      case PageType.Locations:
        return <Locations {...props} />;
      case PageType.Gone410:
        return <>{props.message}</>;
      default:
        return <div>Page type not defined</div>;
    }
  };

  return renderPageContent();
};
ListingCentrePage.displayName = 'ListingCentrePage';

export default memo(ListingCentrePage);

type ListingCentreServerSideProps = { props: ListingPageProps |
ListingPage404Props |
CentrePageProps |
LocationsPageProps |
GonePageProps } | Redirect;

export const getServerSideProps = getServerSidePropsWithError<ListingCentreServerSideProps>(
  async (context: PageContext): Promise<ListingCentreServerSideProps> => {
    const { res, resolvedUrl } = context;

    const pageRequestData = getPageDataFromContext(context);

    const { pathData } = pageRequestData;

    let props: ListingPageProps | ListingPage404Props | CentrePageProps | LocationsPageProps | null = null;

    if (resolvedUrl.match('dummy') || checkIfUrlHaveDuplicatedCountryCode(resolvedUrl, pathData.country)) {
      if (res) {
        res.statusCode = 410;

        return { props: { pageType: PageType.Gone410, message: 'The page you requested was removed' } };
      }
    }
    const location = pathData?.location && pathData?.location?.length > 0 ? pathData?.location[0] : '';
    const result = locations.find((data) => data === location);
    if (result) {
      props = await readLocationsPageData(context);
    } else if (pathData.pageType === PageType.Listing) {
      props = await readListingPageData(context);

      if (props.pageType === PageType.Listing404 && res) {
        res.statusCode = 404;
      }
    } else if (pathData.pageType === PageType.Centre) {
      const redirectUrlForCombinedCentrePages = getRedirectUrlForCombinedCentrePages(resolvedUrl, pathData.spaceType);
      if (redirectUrlForCombinedCentrePages) {
        return {
          redirect: {
            destination: redirectUrlForCombinedCentrePages,
            statusCode: 301,
          },
        };
      }

      props = await readCentrePageData(context);
    }

    if (pathData.spaceType === 'flexible-offices' && props?.headerProps?.seo) {
      props.headerProps.seo = props.headerProps.seo.map((tag) => {
        if (tag.name === 'robots') {
          return { ...tag, content: 'noindex, nofollow' };
        }

        return tag;
      });
    }

    if (!props) {
      throw new Error('Page data loading failed');
    }

    return ({
      props,
    });
  },
);
