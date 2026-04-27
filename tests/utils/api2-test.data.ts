/**
 * API2 Test Data for JSONPlaceholder
 * Contains test data, IDs, and sample payloads for API testing
 */

export const TEST_DATA = {
  VALID_POST_ID: 1,
  INVALID_POST_ID: 99999,
  VALID_USER_ID: 1,
  INVALID_USER_ID: 99999,
  VALID_TODO_ID: 1,
  VALID_COMMENT_ID: 1,
};

export const CREATE_POST_DATA = {
  title: 'Test Post Title',
  body: 'This is a test post body for validating API functionality.',
  userId: 1,
};

export const UPDATE_POST_DATA = {
  title: 'Updated Post Title',
  body: 'This is an updated test post body.',
  userId: 1,
};

export const CREATE_TODO_DATA = {
  title: 'Test Todo Item',
  completed: false,
  userId: 1,
};
