/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

//type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:4000/api/v1/users/updatePassword'
        : 'http://127.0.0.1:4000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    console.log('OK');
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      //   location.reload(true);
    }
  } catch (err) {
    console.log('ERROR');
    showAlert('error', err.response.data.message);
  }
};
