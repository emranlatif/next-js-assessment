import React, { memo, useEffect } from 'react';
import type { NextPage } from 'next';

import readLegalPageData from '@/application/services/readLegalPageData';
import readThankYouPageData from '@/application/services/readThankYouPageData';
import readAboutPageData from '@/application/services/readAboutPageData';
import readStartUpOfficePageData from '@/application/services/readStartUpOfficePageData';
import readDayOfficePageData from '@/application/services/readDayOfficePageData';

import { PageType } from '@/application/enums';

import { LegalPageProps } from '@/components/layout/legal/legal.types';
import { PageContext } from '@/components/common/common.types';
import { ThankYouPageProps } from '@/components/layout/thankyou/thankyou.types';
import { AboutPageProps } from '@/components/layout/about/aboutPageLayout.types';
import { StartUpOfficePageProps } from '@/components/layout/StartUpOffice/StartUpOffice.types';
import ThankYouPageLayout from '@/components/layout/thankyou/ThankYouPageLayout/ThankYouPageLayout';
import AboutPageLayout from '@/components/layout/about/AboutPageLayout';

import { getPageDataFromContext } from '@/helpers/getPageDataFromContext';
import getServerSidePropsWithError from '@/helpers/getServerSidePropsWithError';
import { HttpError } from '@/api/requests';
import LegalPageLayout from '@/components/layout/legal/LegalPageLayout/LegalPageLayout';
import OfficeSpaceLayout from '@/components/layout/officeSpace/OfficeSpaceLayout';
import readOfficeSpacePageData from '@/application/services/readOfficeSpacePageData';
import { OfficeSpacePageProps, ServicedOfficeSpacePageProps } from '@/components/layout/officeSpace/officeSpace.types';
import readCoworkingSpacePageData from '@/application/services/readCoworkingSpacePageData';
import { CoworkingSpacePageProps } from '@/components/layout/coworkingSpace/coworkingSpace.types';
import CoworkingSpaceLayout from '@/components/layout/coworkingSpace/CoworkingSpaceLayout/CoworkingSpaceLayout';
import readServicedOfficeSpacePageData from '@/application/services/readServicedOfficeSpacePageData';
import { redirectedUrl } from '@/helpers/redirects';
import StartUpOffice from '@/components/layout/StartUpOffice/StartUpOffice';
import DayOffice from '@/components/layout/DayOffice/DayOffice';
import { DayOfficePageProps } from '@/components/layout/DayOffice/dayOffice.types';
import readTemporaryOfficePageData from '@/application/services/readTemporaryOfficePageData';
import TemporaryOffice from '@/components/layout/TemporaryOffice/TemporaryOffice';
import { TemporaryOfficePageProps } from '@/components/layout/TemporaryOffice/temporaryOffice.types';

type StaticPageProps = LegalPageProps
| ThankYouPageProps
| OfficeSpacePageProps
| ServicedOfficeSpacePageProps
| CoworkingSpacePageProps
| AboutPageProps
| StartUpOfficePageProps
| DayOfficePageProps
| TemporaryOfficePageProps;

const StaticPage: NextPage<StaticPageProps> = (props: StaticPageProps) => {
  const { pageType, pageContent } = props;

  useEffect(() => {
    document.body.setAttribute('page', pageType);
  }, [pageType]);

  const renderPageContent = () => {
    switch (pageType) {
      case PageType.Privacy:
      case PageType.Terms:
      case PageType.AcceptableUsePolicy:
      case PageType.ComplaintsPolicy:
        return <LegalPageLayout {...pageContent} />;
      case PageType.ThankYou:
        return <ThankYouPageLayout {...props as ThankYouPageProps} />;
      case PageType.OfficeSpace:
      case PageType.ServicedOffice:
        return <OfficeSpaceLayout {...props as OfficeSpacePageProps} />;
      case PageType.CoworkingSpace:
        return <CoworkingSpaceLayout {...props as CoworkingSpacePageProps} />;
      case PageType.About:
        return <AboutPageLayout {...props as AboutPageProps} />;
      case PageType.StartUpOffice:
        return <StartUpOffice {...props as StartUpOfficePageProps} />;
      case PageType.DayOffice:
        return <DayOffice {...props as DayOfficePageProps} />;
      case PageType.TemporaryOffice:
        return <TemporaryOffice {...props as TemporaryOfficePageProps} />;
      default:
        throw new HttpError('Unable to determine page type', 404);
    }
  };

  return renderPageContent();
};
StaticPage.displayName = 'StaticPage';

export default memo(StaticPage);

type StaticPageServerSideProps = { props: StaticPageProps };
export const getServerSideProps = getServerSidePropsWithError<StaticPageServerSideProps>(
  async (context: PageContext): Promise<StaticPageServerSideProps> => {
    const pageRequestData = getPageDataFromContext(context);
    const { pathData } = pageRequestData;

    let props: StaticPageProps | null = null;

    const { pageType } = pathData;
    const { res, query } = context;

    const isShouldRedirect = pageType === PageType.Faq
        || pageType === PageType.DesignYourOffice
        || pageType === PageType.SatelliteOffice
        || pageType === PageType.SharedOffice
        || pageType === PageType.Register;
    const isOneOfLegalPages = pageType === PageType.Privacy
        || pageType === PageType.Terms
        || pageType === PageType.AcceptableUsePolicy
        || pageType === PageType.ComplaintsPolicy;

    if (isShouldRedirect) {
      res?.writeHead(302, {
        Location: `${redirectedUrl(query, pageType)}`,
      });
      res?.end();
    }

    if (isOneOfLegalPages) {
      props = await readLegalPageData(context);
    } else if (pageType === PageType.ThankYou) {
      props = await readThankYouPageData(context);
    } else if (pageType === PageType.OfficeSpace) {
      props = await readOfficeSpacePageData(context);
    } else if (pageType === PageType.ServicedOffice) {
      props = await readServicedOfficeSpacePageData(context);
    } else if (pageType === PageType.CoworkingSpace) {
      props = await readCoworkingSpacePageData(context);
    } else if (pageType === PageType.About) {
      props = await readAboutPageData(context);
    } else if (pageType === PageType.StartUpOffice) {
      props = await readStartUpOfficePageData(context);
    } else if (pageType === PageType.DayOffice) {
      props = await readDayOfficePageData(context);
    } else if (pageType === PageType.TemporaryOffice) {
      props = await readTemporaryOfficePageData(context);
    }

    if (!props) {
      throw new HttpError('Unable to determine page type', 404);
    }

    return ({
      props,
    });
  },
);
