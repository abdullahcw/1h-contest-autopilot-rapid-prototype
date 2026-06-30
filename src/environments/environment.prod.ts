// environmet_name form one of following
// 'DEV' 'DEMO' 'QA' 'STG' 'PROD';
const environmet_name = 'STG';
export const environment = {
  production: true,
  env_path: getConfigUrls('urls', 'env_path', environmet_name),
  env_name: getConfigUrls('urls', 'env_name', environmet_name),
  zendesk_url: getConfigUrls('urls', 'zendesk_url', environmet_name),
  envBucketName: getConfigUrls('urls', 'envBucketName', environmet_name),
  envPrivateBucketName: getConfigUrls('urls', 'envPrivateBucketName', environmet_name),
  region: getConfigUrls('urls', 'region', environmet_name),
  identityPoolId: getConfigUrls('urls', 'identityPoolId', environmet_name),
  questionCSVSample: getConfigUrls('urls', 'questionCSVSample', environmet_name),
  x_api_key: getConfigUrls('urls', 'x_api_key', environmet_name),
  gateway_environment: getConfigUrls('urls', 'gateway_env', environmet_name),
  bucket_config: getConfigUrls('urls', 'bucket_config', environmet_name),
  bucket_sub_config: getConfigUrls('urls', 'bucket_sub_config', environmet_name),
  firebaseConfig: getConfigUrls('urls', 'firebaseConfig', environmet_name),
  fierbase_remote_config: getConfigUrls('urls', 'fierbase_remote_config', environmet_name),
  request_game: getConfigUrls('urls', 'request_game', environmet_name),

  // LaunchDarkly Configuration
  launchDarkly: {
    clientSideID: getConfigUrls('urls', 'launchdarkly_client_id', environmet_name),
    options: {
      bootstrap: 'localStorage',
      sendEvents: false,
      application: {
        id: '1hadmin-client',
        version: '3.3.1'
      }
    }
  }
};
function getConfigUrls(key = '', url = '', env_name) {
  const configObj = (window['configObj'] && window['configObj'][key] && window['configObj'][key][env_name]);
  if (configObj && configObj[url]) {
    return configObj[url];
  }
  return '';
}
