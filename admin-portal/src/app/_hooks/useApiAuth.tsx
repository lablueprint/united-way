import { RequestType, Request, Response } from "../_interfaces/RequestInterfaces";
import { useSelector, useDispatch } from "react-redux";
import { refresh } from '../_utils/redux/orgSlice';
import { RootState } from '../_interfaces/AuthInterfaces';
import axios from "axios";
import { createSelector } from "@reduxjs/toolkit";

const memoizedSelector = createSelector(
    (state) => state.auth,
    (auth) => {
        return { ...auth }; // Returns a new object, but only if the state has changed
    }
);

function useApiAuth() {
    const dispatch = useDispatch();
    const org = useSelector(memoizedSelector);

    function expandId(endpoint: string) {
        return endpoint.replace(":id", org.orgId);
    }

    async function refreshToken(onComplete: (newAuthToken: string) => object) {
        const endpoint = "auth/orgRefresh";
        try {
            const response = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/${endpoint}`, {}, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${org.refreshToken}`
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
        ex: orgs
            orgs/createOrg
            orgs/:id
    */
    async function sendRequest({ requestType, endpoint, body }: Request): Any {
        let response;
        switch (requestType) {
            case RequestType.GET: {
                try {
                    response = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/${expandId(endpoint)}`, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${org.authToken}`
                        }
                    })
                    const { data }: Response = response.data;
                    return data;
                } catch (error) {
                    console.error(error);
                    if (error.response.status === 401) {
                        return refreshToken(async (newAuthToken: string) => {
                            response = await axios.get(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/${expandId(endpoint)}`, {
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
                    response = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/${expandId(endpoint)}`, body,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${org.authToken}`
                            }
                        })
                    const { data }: Response = response.data;
                    return data;
                    break;
                } catch (error) {
                    console.error(error);
                    if (error.response.status === 401) {
                        return refreshToken(async (newAuthToken: string) => {
                            response = await axios.patch(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/${expandId(endpoint)}`, body,
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
                    response = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/${expandId(endpoint)}`, body,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${org.authToken}`
                            }
                        });

                    const { data }: Response = response.data;
                    return data;
                } catch (error) {
                    console.error(error);
                    if (error.response.status === 401) {
                        return refreshToken(async (newAuthToken: string) => {
                            response = await axios.post(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/${expandId(endpoint)}`, body,
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
                    response = await axios.delete(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/${expandId(endpoint)}`, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${org.authToken}`
                        }
                    })
                    const { data }: Response = response.data;
                    return data;
                } catch (error) {
                    console.error(error);
                    if (error.response.status === 401) {
                        return refreshToken(async (newAuthToken: string) => {
                            response = await axios.delete(`http://${process.env.IP_ADDRESS}:${process.env.PORT}/${expandId(endpoint)}`, {
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

    return [org, sendRequest];
}

export default useApiAuth;