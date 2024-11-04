import { useEffect, useState } from 'react';
import authApi from '../utils/ApiAuth';
import { isNullOrEmpty } from '../utils/Utils';
import { subjectSettingData } from '../data/ConstantData';

const useQueryCriteria = ({
    currentPage,
    itemPerPage,
    setTotalElements,
    search,
    assignmentId,
    sortBy,
    orderBy,
    setCriterias
}) => {

    const [criteriaResponse, setCriteriaResponse] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCriterias = async () => {
            try {
                const response = await authApi.post('/evaluation-criteria/search', {
                    pageIndex: currentPage,
                    pageSize: itemPerPage,
                    sortBy: sortBy,
                    orderBy: orderBy,
                    criteriaName: search?.criteriaName,
                    minEvalWeight: search?.minEvalWeight,
                    maxEvalWeight: search?.maxEvalWeight,
                    active: search?.active?.value,
                    assignmentId: assignmentId
                });
                console.log('criterias: ', response.data.data);
                if(response.data.statusCode === 200) {
                    setCriterias(response.data.data.evaluationCriteriaDTOS);
                    setTotalElements(response.data.data.totalElements);
                }else{
                    setError(response.data.data);
                }
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchCriterias();

        return () => {
        };
    }, [currentPage, search, sortBy, orderBy]);

    return { criteriaResponse, loading, error };
};

export default useQueryCriteria;
