interface DataItem {
  inventory: string;
  metadata: string;
  position: string;
  gang: string;
  job: string;
  charinfo: string;
  money: string;
  license: string;
  cid: string;
  citizenid: string;
  id: number;
  name: string;
  vehicles: string;
  pfp: string;
}

type JobWealthData = {
  totalWealth: number;
  count: number;
  averageWealth: number;
};

function getRandomColor() { /* just a fun little thing lmao */
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function formatMoney(value: number | bigint, currencyCode = 'USD', isCrypto = false) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: isCrypto ? 4 : 2,
    maximumFractionDigits: isCrypto ? 4 : 2,
  }).format(value);
}

function getWealthPerJob(data: DataItem[]) {
  return data.reduce((acc, item) => {
    const jobData = typeof item.job === 'string' ? JSON.parse(item.job) : item.job;
    const jobLabel = jobData.label;
    const moneyData = typeof item.money === 'string' ? JSON.parse(item.money) : item.money;
    const totalWealth = moneyData.bank + moneyData.cash;

    if (!acc[jobLabel]) {
      acc[jobLabel] = {
        totalWealth: 0,
        count: 0,
        averageWealth: 0
      };
    }

    acc[jobLabel].totalWealth += totalWealth;
    acc[jobLabel].count += 1;
    acc[jobLabel].averageWealth = acc[jobLabel].totalWealth / acc[jobLabel].count;

    return acc;
  }, {} as Record<string, JobWealthData>);
}

export { getRandomColor, formatMoney, getWealthPerJob };