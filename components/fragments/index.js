import { graphql,
    ArticleMetadataFragment,
  AudioMetadataFragment,
  TextOnlyMetadataFragment,
  ImageMetadataFragment,
  VideoMetadataFragment,
  UsernameFragment
 } from "@lens-protocol/client";

export const PostMetadataFragment = graphql(
  `
    fragment PostMetadata on PostMetadata {
      __typename
      ... on ArticleMetadata {
        ...ArticleMetadata
      }
      ... on AudioMetadata {
        ...AudioMetadata
      }
      ... on TextOnlyMetadata {
        ...TextOnlyMetadata
      }
      ... on ImageMetadata {
        ...ImageMetadata
      }
      ... on VideoMetadata {
        ...VideoMetadata
      }
    }
  `,
  [
    ArticleMetadataFragment,
    AudioMetadataFragment,
    TextOnlyMetadataFragment,
    ImageMetadataFragment,
    VideoMetadataFragment,
  ]
);


export const AccountMetadataFragment = graphql(
  `
    fragment AccountMetadata on AccountMetadata {
      name
      bio

      thumbnail: picture(
        request: { preferTransform: { fixedSize: { height: 128, width: 128 } } }
      )
      picture
    }  `
);

export const AccountFragment = graphql(
  `
    fragment Account on Account {
      __typename
      username {
        ...Username
      }
      address
      metadata {
        ...AccountMetadata
      }
    }
  `,
  [UsernameFragment, AccountMetadataFragment]
);

export const fragments = [
  AccountFragment,
  PostMetadataFragment,
];