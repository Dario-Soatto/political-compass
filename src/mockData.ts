import { ScrapeResponse } from '@/types/twitter';

export const mockTweetData: ScrapeResponse = {
  success: true,
  count: 10,
  tweets: [
    {
      id: "1234567890123456789",
      text: "The government should focus on reducing regulations that stifle innovation and entrepreneurship. Small businesses are the backbone of our economy! #SmallBusiness #Innovation",
      created_at: "2024-01-15T10:30:00.000Z",
      retweet_count: 245,
      like_count: 1203,
      reply_count: 89,
      user: {
        username: "testuser",
        display_name: "Test User",
        followers_count: 15420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456790",
      text: "Healthcare should be a human right, not a privilege. We need universal healthcare that ensures everyone can get the care they need regardless of their income. #HealthcareForAll",
      created_at: "2024-01-14T15:45:00.000Z",
      retweet_count: 892,
      like_count: 3456,
      reply_count: 234,
      user: {
        username: "testuser",
        display_name: "Test User",
        followers_count: 15420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456791",
      text: "Personal freedom and individual responsibility are fundamental. The government should protect our rights, not tell us how to live our lives. #Liberty #Freedom",
      created_at: "2024-01-13T09:20:00.000Z",
      retweet_count: 567,
      like_count: 2134,
      reply_count: 156,
      user: {
        username: "testuser",
        display_name: "Test User",
        followers_count: 15420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456792",
      text: "Climate change is real and we need immediate action. Investing in renewable energy and green jobs will secure our future and create economic opportunities. #ClimateAction #GreenEnergy",
      created_at: "2024-01-12T14:15:00.000Z",
      retweet_count: 1234,
      like_count: 4567,
      reply_count: 345,
      user: {
        username: "testuser",
        display_name: "Test User",
        followers_count: 15420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456793",
      text: "Strong borders and immigration enforcement are essential for national security. We need to know who's coming into our country. #BorderSecurity #Immigration",
      created_at: "2024-01-11T11:30:00.000Z",
      retweet_count: 678,
      like_count: 2890,
      reply_count: 234,
      user: {
        username: "testuser",
        display_name: "Test User",
        followers_count: 15420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456794",
      text: "Education funding should be a top priority. Every child deserves access to quality education regardless of their zip code. Invest in our teachers and schools! #Education #PublicSchools",
      created_at: "2024-01-10T16:45:00.000Z",
      retweet_count: 445,
      like_count: 1876,
      reply_count: 123,
      user: {
        username: "testuser",
        display_name: "Test User",
        followers_count: 15420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456795",
      text: "The free market works best when government stays out of the way. Competition drives innovation and keeps prices fair for consumers. #FreeMarket #Capitalism",
      created_at: "2024-01-09T13:20:00.000Z",
      retweet_count: 334,
      like_count: 1445,
      reply_count: 98,
      user: {
        username: "testuser",
        display_name: "Test User",
        followers_count: 15420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456796",
      text: "Workers deserve fair wages and the right to organize. Income inequality is at historic levels - we need policies that support working families. #WorkersRights #LivingWage",
      created_at: "2024-01-08T08:10:00.000Z",
      retweet_count: 756,
      like_count: 3234,
      reply_count: 189,
      user: {
        username: "testuser",
        display_name: "Test User",
        followers_count: 15420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456797",
      text: "Privacy rights are fundamental in the digital age. Big tech companies shouldn't be collecting and selling our personal data without explicit consent. #Privacy #DigitalRights",
      created_at: "2024-01-07T19:30:00.000Z",
      retweet_count: 523,
      like_count: 2167,
      reply_count: 145,
      user: {
        username: "testuser",
        display_name: "Test User",
        followers_count: 15420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456798",
      text: "Military spending should be scrutinized like any other government program. We can support our troops while being responsible with taxpayer money. #FiscalResponsibility #Defense",
      created_at: "2024-01-06T12:15:00.000Z",
      retweet_count: 289,
      like_count: 1534,
      reply_count: 234,
      user: {
        username: "testuser",
        display_name: "Test User",
        followers_count: 15420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    }
  ]
};

// Mock data for different political leanings - you can switch between these for testing
export const mockConservativeData: ScrapeResponse = {
  success: true,
  count: 5,
  tweets: [
    {
      id: "1234567890123456800",
      text: "Traditional values and strong families are the foundation of a healthy society. We must protect our constitutional rights and preserve our heritage. #TraditionalValues #Constitution",
      created_at: "2024-01-15T10:30:00.000Z",
      retweet_count: 445,
      like_count: 2203,
      reply_count: 189,
      user: {
        username: "conservative_user",
        display_name: "Conservative User",
        followers_count: 25420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456801",
      text: "Lower taxes mean more money in the pockets of hardworking Americans. Government spending is out of control - we need fiscal responsibility! #LowerTaxes #FiscalConservatism",
      created_at: "2024-01-14T15:45:00.000Z",
      retweet_count: 692,
      like_count: 3156,
      reply_count: 134,
      user: {
        username: "conservative_user",
        display_name: "Conservative User",
        followers_count: 25420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456802",
      text: "Law and order must be maintained. We need to support our police officers and ensure criminals face consequences for their actions. #BackTheBlue #LawAndOrder",
      created_at: "2024-01-13T09:20:00.000Z",
      retweet_count: 867,
      like_count: 4134,
      reply_count: 256,
      user: {
        username: "conservative_user",
        display_name: "Conservative User",
        followers_count: 25420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456803",
      text: "School choice gives parents the power to decide what's best for their children's education. Competition improves outcomes for everyone. #SchoolChoice #ParentalRights",
      created_at: "2024-01-12T14:15:00.000Z",
      retweet_count: 534,
      like_count: 2567,
      reply_count: 145,
      user: {
        username: "conservative_user",
        display_name: "Conservative User",
        followers_count: 25420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456804",
      text: "America First policies protect our workers and industries. We need fair trade deals that put American interests first. #AmericaFirst #FairTrade",
      created_at: "2024-01-11T11:30:00.000Z",
      retweet_count: 778,
      like_count: 3890,
      reply_count: 234,
      user: {
        username: "conservative_user",
        display_name: "Conservative User",
        followers_count: 25420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    }
  ]
};

export const mockLiberalData: ScrapeResponse = {
  success: true,
  count: 5,
  tweets: [
    {
      id: "1234567890123456900",
      text: "Social justice and equality should be at the center of our policies. Everyone deserves equal opportunities regardless of background. #SocialJustice #Equality",
      created_at: "2024-01-15T10:30:00.000Z",
      retweet_count: 1245,
      like_count: 5203,
      reply_count: 389,
      user: {
        username: "liberal_user",
        display_name: "Liberal User",
        followers_count: 35420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456901",
      text: "We need comprehensive gun reform to keep our communities safe. Common-sense measures like background checks have broad public support. #GunReform #PublicSafety",
      created_at: "2024-01-14T15:45:00.000Z",
      retweet_count: 2892,
      like_count: 8456,
      reply_count: 534,
      user: {
        username: "liberal_user",
        display_name: "Liberal User",
        followers_count: 35420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456902",
      text: "Reproductive rights are human rights. Women should have the freedom to make their own healthcare decisions. #ReproductiveRights #WomensRights",
      created_at: "2024-01-13T09:20:00.000Z",
      retweet_count: 3567,
      like_count: 12134,
      reply_count: 756,
      user: {
        username: "liberal_user",
        display_name: "Liberal User",
        followers_count: 35420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456903",
      text: "Diversity and inclusion make our institutions stronger. We must continue working to dismantle systemic racism and create equal opportunities for all. #DiversityAndInclusion #AntiRacism",
      created_at: "2024-01-12T14:15:00.000Z",
      retweet_count: 1834,
      like_count: 6567,
      reply_count: 445,
      user: {
        username: "liberal_user",
        display_name: "Liberal User",
        followers_count: 35420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    },
    {
      id: "1234567890123456904",
      text: "Wealthy corporations and individuals must pay their fair share in taxes. We need revenue to fund essential services and infrastructure. #TaxTheRich #FairShare",
      created_at: "2024-01-11T11:30:00.000Z",
      retweet_count: 2278,
      like_count: 9890,
      reply_count: 634,
      user: {
        username: "liberal_user",
        display_name: "Liberal User",
        followers_count: 35420,
        profile_image_url: "https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg"
      }
    }
  ]
};
