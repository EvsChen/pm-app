import { message } from 'antd';

export const handleSuccess = text => {
  message.success(text, 2.5);
}
export const handleError = err => {
  if (err instanceof Error) {
    message.error(`${err.name}: ${err.message}`);
  }
}

const util = {
  handleSuccess,
  handleError
};

export default util;
