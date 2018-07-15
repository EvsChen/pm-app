import { message } from 'antd';

export const handleSuccess = text => {
  message.success(text, 2.5);
}
export const handleError = err => {
  if (err instanceof Error) {
    message.error(`${err.name}: ${err.message}`);
  }
  else if (err.message) {
    message.error(err.message);
  }
  else {
    console.log(err)
    message.error('Failure. See the console for more info');
  }
}

const util = {
  handleSuccess,
  handleError
};

export default util;
