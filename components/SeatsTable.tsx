import { useEffect, useRef, useMemo, useState, forwardRef, useCallback } from 'react'
import { Column, useAsyncDebounce, useGlobalFilter, useRowSelect, useSortBy, useTable } from 'react-table'
import { Box, Button, Checkbox, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core'
import MaUTable from '@material-ui/core/Table'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import firebase from 'firebase/app'
import 'firebase/database'
import { toast } from 'react-toastify'

dayjs.extend(relativeTime)

interface SignUp {
    email: string,
    name: string,
    picture: string,
    selected: number,
    submitTime: number,
    docKey: string
}

interface SeatsTable {
    signups: SignUp[]
}

// @ts-ignore
const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
        const defaultRef = useRef()
        const resolvedRef = ref || defaultRef

        useEffect(() => {
            // @ts-ignore
            resolvedRef.current.indeterminate = indeterminate
        }, [resolvedRef, indeterminate])

        return (
            <>
                {/* @ts-ignore */}
                <Checkbox ref={resolvedRef} {...rest} />
            </>
        )
    }
)

interface FilterProps {
    preGlobalFilteredRows: any
    globalFilter: any
    setGlobalFilter: any
}

// Define a default UI for filtering
function GlobalFilter ({
                           preGlobalFilteredRows,
                           globalFilter,
                           setGlobalFilter
                       }: FilterProps) {
    const count = preGlobalFilteredRows.length
    const [value, setValue] = useState(globalFilter)
    const onChange = useAsyncDebounce(value => {
        setGlobalFilter(value || undefined)
    }, 200)

    return (
        <span>
            <Typography variant={'body1'}>Search: {' '}
                <input
                    value={value || ""}
                    onChange={e => {
                        setValue(e.target.value)
                        onChange(e.target.value)
                    }}
                    placeholder={`${count} records...`}
                    style={{
                        fontSize: '1.1rem',
                        border: '0'
                    }}
                />
            </Typography>
        </span>
    )
}

const SeatsTable = ({ signups }: SeatsTable) => {
    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name' // accessor is the "key" in the data
            },
            {
                Header: 'Seat #',
                accessor: 'selected'
            },
            {
                Header: 'Relative Time',
                accessor: 'submitTime',
                Cell: ({ cell: { value } }) => dayjs(+value).fromNow(),
                disableGlobalFilter: true
            },

            {
                Header: 'Submission Time',
                accessor: '_submitTime',
                Cell: ({ cell: { value } }) => dayjs(+value).format('MM/DD/YYYY hh:mm A'),
                disableGlobalFilter: true
            },

            {
                Header: 'Email',
                accessor: 'email'
            },
            {
                Header: 'Profile Picture',
                accessor: 'picture',
                maxWidth: 45,
                Cell: ({ cell: { value } }) => <img src={value} alt={'user_pfp'} style={{ maxWidth: 45 }}/>,
                disableGlobalFilter: true
            }
        ],
        []
    ) as Column<SignUp & { _submitTime: number }>[]

    const flatSignups = JSON.stringify(signups)
    const data = useMemo(() => signups, [flatSignups])

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        visibleColumns,
        state,
        preGlobalFilteredRows,
        setGlobalFilter
    } = useTable({
            columns, data: data.map(_o => ({
                ..._o,
                _submitTime: _o.submitTime
            })),
            // @ts-ignore
            autoResetSortBy: false,
            autoResetGlobalFilter: false,
            autoResetSelectedRows: false
        },
        useGlobalFilter,
        useSortBy,
        useRowSelect,
        hooks => {
            hooks.allColumns.push(columns => [
                {
                    id: 'selection',
                    // @ts-ignore
                    Header: ({ getToggleAllRowsSelectedProps }) => (
                        <div>
                            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                        </div>
                    ),
                    // @ts-ignore
                    Cell: ({ row }) => (
                        <div>
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
                    )
                },
                ...columns
            ])
        }
    ) as any

    const selectedRowIds = state?.selectedRowIds || {}
    const selected = Object.keys(selectedRowIds).map(_k => selectedRowIds[_k] ? +_k : -1).filter(_s => _s > -1)

    const flatSelected = JSON.stringify(selectedRowIds)

    const removeSubmission = useCallback(async () => {
        const database = firebase.database()
        const _privateData = selected.map(idx => data[idx])

        const docKeys = _privateData.map(_s => _s.docKey)
        const seatNums = _privateData.map(_s => _s.selected)

        console.debug(selected.map(idx => data[idx]))

        // free up private collection first

        let updates = {} as { [key: string]: null }
        docKeys.forEach(_key => {
            updates[`/private-seating-choices/${_key}`] = null
        })

        console.debug('private update: ', updates)

        const privResults = await database.ref().update(updates)

        // free up public collection once confirmed private gone
        const _publicDocs = await database.ref('/public-seating-arrangement').once('value')
        const publicDocs = _publicDocs.val()
        const publicSeats = Object.keys(publicDocs).map(_k => ({
            ...publicDocs[_k],
            docKey: _k
        })).sort((a, b) => a.i - b.i)

        let pubUpdates = {} as { [key: string]: any }
        publicSeats.forEach(_doc => {
            if (seatNums.includes(_doc.i)) {
                pubUpdates[`/public-seating-arrangement/${_doc.docKey}`] = {
                    ..._doc,
                    docKey: null,
                    taken: null
                }
            }
        })

        console.debug('public update: ', pubUpdates)

        try {
            await database.ref().update(pubUpdates)
        } catch (e) {
            toast.error('There has been an error on step 2 of the removal process. Because I was too lazy to add transactions, the database is now out of sync :) Message me.')
        }
    }, [flatSignups, flatSelected])

    return <>
        {selected.length > 0
            ? <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <h2 id="signups-modal-title">You've selected {selected.length} user{selected.length > 1 ? 's' : ''}</h2>
                <Button size={'small'} variant={'contained'} onClick={() => {
                    removeSubmission().then(_r => {

                    }).catch(err => {
                        if (err.toString().includes("PERMISSION_DENIED")) {
                            toast.error('sorry! you do not have the necessary permissions to conduct this action')
                        } else {
                            toast.error('an unexpected error occurred.')
                        }
                    })
                }}>
                    Remove Submission{selected.length > 1 ? 's' : ''}
                </Button>
            </Box>
            : <h2 id="signups-modal-title">Here are all of the sign ups!</h2>
        }
        <MaUTable {...getTableProps()}>
            <TableHead>
                <TableRow>
                    <TableCell colSpan={visibleColumns.length}
                        style={{
                            textAlign: 'left'
                        }}>
                        <GlobalFilter
                            preGlobalFilteredRows={preGlobalFilteredRows}
                            globalFilter={state.globalFilter}
                            setGlobalFilter={setGlobalFilter}
                        />
                    </TableCell>
                </TableRow>
                {/* @ts-ignore */}
                {headerGroups.map(headerGroup => (
                    <TableRow {...headerGroup.getHeaderGroupProps()}>
                        {/* @ts-ignore */}
                        {headerGroup.headers.map(column => (
                            <TableCell {...(column.id === 'selection'
                                ? column.getHeaderProps()
                                : column.getHeaderProps(column.getSortByToggleProps()))}>
                                {column.render('Header')}
                                {column.id !== 'selection' ? (
                                    <TableSortLabel
                                        active={column.isSorted}
                                        // react-table has a unsorted state which is not treated here
                                        direction={column.isSortedDesc ? 'desc' : 'asc'}
                                    />
                                ) : null}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableHead>
            <TableBody>
                {/* @ts-ignore */}
                {rows.map((row) => {
                    prepareRow(row)
                    return (
                        <TableRow {...row.getRowProps()}>
                            {/* @ts-ignore */}
                            {row.cells.map(cell => {
                                return (
                                    <TableCell {...cell.getCellProps()}>
                                        {cell.render('Cell')}
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                    )
                })}
            </TableBody>
        </MaUTable>
    </>
}

export default SeatsTable
