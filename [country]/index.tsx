import React from 'react';
import { NextPage } from 'next';
import readHomePageData from '@/application/services/readHomePageData';
import { HomePageProps } from '@/components/layout/home/home.types';
import { PageContext } from '@/components/common/common.types';
import HomePageLayout from '@/components/layout/home/HomePageLayout/HomePageLayout';
import getServerSidePropsWithError from '@/helpers/getServerSidePropsWithError';

const HomePage: NextPage<HomePageProps> = (props: HomePageProps) => <HomePageLayout {...props} />;

type HomeServerSideProps = { props: HomePageProps };
export const getServerSideProps = getServerSidePropsWithError<HomeServerSideProps>(
  async (context: PageContext): Promise<HomeServerSideProps> => ({
    props: await readHomePageData(context),
  }),
);

export default HomePage;
