import LinkList from './link-list'

const DEFAULT_VALUE = [
  {
    id: 'apps',
    title: 'Apps',
    href: '/',
  },
  {
    id: 'datasets',
    title: 'Datasets',
    href: '/datasets',
  },
]

export default function MineList() {
  return <LinkList value={DEFAULT_VALUE} />
}
