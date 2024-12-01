import { useEffect, useState } from 'react';
import authApi from '../utils/ApiAuth';
import { isNullOrEmpty } from '../utils/Utils';
import { evaluationTypes } from '../data/ConstantData';

const useQueryMilestone = ({
    currentPage,
    itemPerPage,
    setTotalElements,
    search,
    sortBy,
    orderBy,
    setMilestones,
    active
}) => {

    const [milestoneResponses, setMilestoneResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                setLoading(true);
                const response = await authApi.post('/milestone/search', {
                    pageIndex: currentPage,
                    pageSize: itemPerPage,
                    sortBy: sortBy,
                    orderBy: orderBy,
                    active: isNullOrEmpty(active) ? null : active,
                    classId: search?.class?.value
                });
                console.log('milestone: ', response.data.data);
                if(response.data.statusCode === 200) {
                    let rMilestone = response.data.data.milestoneResponses;
                    setMilestones(rMilestone.filter(item => item.evaluationType !== evaluationTypes[2].value));
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

        fetchMilestones();

        return () => {
        };
    }, [currentPage, search.class, sortBy, orderBy]);

    return { milestoneResponses, loading, error };
};

export default useQueryMilestone;
