import { useEffect, useState } from 'react';
import authApi from '../utils/ApiAuth';
import { isNullOrEmpty } from '../utils/Utils';
import { subjectSettingData } from '../data/ConstantData';

const useQuerySubjectSetting = ({
    currentPage,
    itemPerPage,
    setTotalElements,
    search,
    subjectId,
    sortBy,
    orderBy,
    setSubjectSettings
}) => {

    const [subjectSettingResponse, setSubjectSettingResponse] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubjectSettings = async () => {
            try {
                const response = await authApi.post('/setting/search', {
                    pageIndex: currentPage,
                    pageSize: itemPerPage,
                    sortBy: sortBy,
                    orderBy: orderBy,
                    name: search?.name,
                    type: search?.type?.value,
                    active: search?.active?.value,
                    subjectId: subjectId,
                    isSubjectSetting: true,
                });
                console.log('subject-settings: ', response.data.data);
                if(response.data.statusCode === 200) {
                    setSubjectSettings(response.data.data.settingDTOS);
                    setTotalElements(response.data.data.totalElements);
                }else{
                    setError(response.data.data);
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectSettings();

        return () => {
        };
    }, [currentPage, search, sortBy, orderBy]);

    return { subjectSettingResponse, loading, error };
};

export default useQuerySubjectSetting;
