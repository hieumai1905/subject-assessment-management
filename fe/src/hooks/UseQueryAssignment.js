import { useEffect, useState } from 'react';
import authApi from '../utils/ApiAuth';
import { isNullOrEmpty } from '../utils/Utils';

const useQueryAssignment = ({
    currentPage,
    itemPerPage,
    setTotalElements,
    search,
    subjectId,
    sortBy,
    orderBy,
    setAssignments,
    reload,
}) => {

    const [subjectSettingResponse, setSubjectSettingResponse] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                setLoading(true);
                const response = await authApi.post('/assignment/search', {
                    pageIndex: currentPage,
                    pageSize: itemPerPage,
                    sortBy: sortBy,
                    orderBy: orderBy,
                    title: search?.title,
                    minExpectedLoc: isNullOrEmpty(search?.minExpectedLoc) ? null : search?.minExpectedLoc,
                    maxExpectedLoc: isNullOrEmpty(search?.maxExpectedLoc) ? null : search?.maxExpectedLoc,
                    active: search?.active?.value,
                    subjectId: subjectId
                });
                console.log('assignments: ', response.data.data);
                if(response.data.statusCode === 200) {
                    setAssignments(response.data.data.assignmentDTOS);
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

        fetchAssignments();

        return () => {
        };
    }, [currentPage, search, sortBy, orderBy, subjectId, reload]);

    return { subjectSettingResponse, loading, error };
};

export default useQueryAssignment;
