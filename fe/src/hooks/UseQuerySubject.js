import { useEffect, useState } from 'react';
import authApi from '../utils/ApiAuth';
import { isNullOrEmpty } from '../utils/Utils';

const useQuerySubject = ({
    currentPage,
    itemPerPage,
    setTotalElements,
    searchSubjects,
    sortBy,
    orderBy,
    setSubjects
}) => {

    const [subjectResponse, setSubjectResponse] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await authApi.post('/subjects/search', {
                    pageIndex: currentPage,
                    pageSize: itemPerPage,
                    sortBy: sortBy,
                    orderBy: orderBy,
                    nameOrCode: searchSubjects.nameOrCode,
                    managerId: searchSubjects.managerId,
                    active: isNullOrEmpty(searchSubjects.status) 
                        ? null : searchSubjects.status === "Active",
                });
                console.log('subjects: ', response.data.data);
                // setSubjectResponse(response.data.data);
                setSubjects(response.data.data.subjects);
                setTotalElements(response.data.data.totalElements);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchSubjects();

        return () => {
        };
    }, [currentPage, searchSubjects, sortBy, orderBy]);

    return { subjectResponse, loading, error };
};

export default useQuerySubject;
