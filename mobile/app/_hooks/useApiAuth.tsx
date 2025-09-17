import { createSelector } from "@reduxjs/toolkit";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Request, RequestType, Response } from "../_interfaces/RequestInterfaces";
import { refresh } from '../_utils/redux/userSlice';

const memoizedSelector = createSelector(
    (state) => state.auth,
    (auth) => {
        return { ...auth }; // Returns a new object, but only if the state has changed
    }
);

function useApiAuth() {
    const dispatch = useDispatch();
    const user = useSelector(memoizedSelector);

    function expandId(endpoint: string) {
        return endpoint.replace(":id", user.userId);
    }

    async function refreshToken(onComplete: (newAuthToken: string) => object) {
        const endpoint = "auth/userRefresh";
        try {
            const response = await axios.post(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/api/${endpoint}`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.refreshToken}`
                }
            })
            const { data } = response.data;
            await dispatch(refresh({
                authToken: data.accessToken
            }));

            return onComplete(data.accessToken);
        } catch (exception) {
            console.error(exception);
        }
    }

    /*
        Note: url is defined to be the resource locator.
        ex: users
            users/createuser
            users/:id
    */
    async function sendRequest({ requestType, endpoint, body }: Request) {
        let response;
        switch (requestType) {
            case RequestType.GET: {
                try {
                    response = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/api/${expandId(endpoint)}`, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.authToken}`
                        }
                    })
                    const { data }: Response = response.data;
                    return data;
                } catch (error) {
                    console.error(error);
                    if (error.response.status === 401) {
                        return refreshToken(async (newAuthToken: string) => {
                            response = await axios.get(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/api/${expandId(endpoint)}`, {
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${newAuthToken}`
                                }
                            })

                            return response.data.data;
                        });
                    }
                }
            }
            case RequestType.PATCH: {
                try {
                    response = await axios.patch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/api/${expandId(endpoint)}`, body,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${user.authToken}`
                            }
                        })
                    const { data }: Response = response.data;
                    return data;
                    break;
                } catch (error) {
                    console.error(error);
                    if (error.response.status === 401) {
                        return refreshToken(async (newAuthToken: string) => {
                            response = await axios.patch(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/api/${expandId(endpoint)}`, body,
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${newAuthToken}`
                                    }
                                })

                            return response.data.data;
                        });
                    }
                }
            }
            case RequestType.POST: {
                try {
                    response = await axios.post(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/api/${expandId(endpoint)}`, body,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${user.authToken}`
                            }
                        });

                    const { data }: Response = response.data;
                    return data;
                } catch (error) {
                    console.error(error);
                    if (error.response.status === 401) {
                        return refreshToken(async (newAuthToken: string) => {
                            response = await axios.post(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/api/${expandId(endpoint)}`, body,
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Authorization": `Bearer ${newAuthToken}`
                                    }
                                })

                            return response.data.data;
                        });
                    }
                }
            }
            case RequestType.DELETE: {
                try {
                    response = await axios.delete(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/api/${expandId(endpoint)}`, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${user.authToken}`
                        }
                    })
                    const { data }: Response = response.data;
                    return data;
                } catch (error) {
                    console.error(error);
                    if (error.response.status === 401) {
                        return refreshToken(async (newAuthToken: string) => {
                            response = await axios.delete(`http://${process.env.EXPO_PUBLIC_SERVER_IP}:${process.env.EXPO_PUBLIC_SERVER_PORT}/api/${expandId(endpoint)}`, {
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${newAuthToken}`
                                }
                            });

                            return response.data.data;
                        });
                    }
                }
            }
        }
    }

    return [user, sendRequest];
}

export default useApiAuth;