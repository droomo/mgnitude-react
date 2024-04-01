import React, {useState} from "react";
import {API, page_data} from "../const";
import Trial, {TrialData} from "./Trial";
import PageMask from "./Page/PageMask";
import classes from "./css/exp.module.scss";
import {useNavigate} from "react-router-dom";
import {HelperText} from "./Page/HelperText";
import axios from "axios";


export default function ExperimentTest() {
    const [trialDataList, setTrialDataList] = React.useState<TrialData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [tryTimes, setTryTimes] = useState(0);

    const navigate = useNavigate();

    function requestTrial() {
        axios.get(`${API.base_url}${page_data['api_make_or_get_trial']}`, {
            params: {
                trial_type: "T",
            }
        }).then(response => {
            const data: {
                trials: TrialData[],
                last_trial_index: number
            } = response.data;

            let i = 0;
            for (const t of data.trials) {
                if (!t.done) {
                    setCurrentIndex(i)
                    break
                }
                i++;
            }

            data.trials[0].duration = 6000;
            setTrialDataList(data.trials);
        })
    }

    return <>
        {trialDataList.length > 0 &&
            <Trial
                trial={trialDataList[currentIndex]}
                done={() => {
                    if (currentIndex + 1 === trialDataList.length) {
                        setTrialDataList([]);
                    }
                    setCurrentIndex(i => i + 1);
                    setTryTimes(i => i + 1);
                }}
                helperText={
                    {
                        scene: currentIndex < 3 ? <HelperText>
                            <p>请观察你所处的空间大小，并感受时间的流逝</p>
                            <p>稍后需要你还原这个<strong style={{color: 'red'}}>房间的大小</strong></p>
                        </HelperText> : undefined,
                        reaction: currentIndex < 3 ? <HelperText>
                            <p>请复现空间</p>
                            <p>控制多面体的大小反应你感受到的房间的<strong style={{color: 'red'}}>相对大小</strong></p>
                            <p>只要求大小比例对应，不要求体积绝对相符</p>
                            <strong>控制方法：</strong>
                            <p>1. 使用鼠标滚轮控制多面体的体积</p>
                            <p>2. 完成后，点击下方的“完成”按钮</p>
                        </HelperText> : undefined
                    }
                }
            />
        }
        {trialDataList.length === 0 && <PageMask text={<div style={{
            cursor: 'default'
        }}>
            <div className={classes.content}>
                <div className={classes.descriptionTextSmall}>
                    <p>相信你已经熟悉所呈现的场景了，即将进入<strong
                        style={{color: 'red'}}>空间复现</strong>实验流程
                    </p>
                </div>
                <p className={classes.descriptionTextSmall}>现在请开始正式实验前的练习</p>
                <div>
                    <span onClick={requestTrial} className={classes.fakeButton}>{tryTimes > 0 && "重新"}开始练习</span>
                </div>
                {tryTimes > 0 && <>
                    <p className={classes.descriptionTextSmall}>正式实验一旦开始则无法退出，实验过程中有休息时间</p>
                    <span
                        onClick={() => {
                            navigate('/')
                        }}
                        className={classes.fakeButton}
                        style={{fontSize: '1rem'}}
                    >不需要练习了，开始正式实验</span>
                </>}
            </div>
        </div>}/>}
    </>
}
