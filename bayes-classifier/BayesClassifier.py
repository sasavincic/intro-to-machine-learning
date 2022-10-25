from cgi import test
import numpy
import pandas
from sklearn import metrics, svm
import matplotlib.pyplot as plt

#Load CSV and shuffle the data randomly
def prepareDataset(csvFileName):
    dataset = pandas.read_csv(csvFileName)
    dataset = dataset.sample(frac=1).reset_index(drop=True)
    return dataset

#Create n-amount of folds and save them in a list
def createFolds(dataset, numOfFolds):
    partitonSize = int(len(dataset)/numOfFolds)
    folds = []
    for i in range(numOfFolds):
        if(i == numOfFolds-1):
            folds += [dataset[i*partitonSize:len(dataset)]]
        else:
            folds += [dataset[i*partitonSize:(i+1)*partitonSize]]
    return folds

#Asign fold[i] as the testing-set and join the rest into a training-set
def assignFolds(folds, i):
    tmp = folds.copy()
    testingSet = tmp.pop(i)
    trainingSet = pandas.concat(tmp)
    return [testingSet, trainingSet]

#Train model usign training-set
def train(trainingSet):
    likelihood = {}
    prior = trainingSet.groupby(trainingSet.columns[0]).size().div(len(trainingSet))
    for i in range(len(trainingSet.columns)-1):
        attr = trainingSet.columns[i+1]
        likelihood[attr] = trainingSet.groupby([trainingSet.columns[0], attr]).size().unstack(fill_value=0).stack().div(len(trainingSet)).div(prior)
    return [likelihood, prior]

#Predict using testing-set returning the predicted values and the actual values
def predict(likelihood, testingSet,  prior):
    predictedValues = []
    actualValues = [(0 if testingSet.iat[i,0] == 'no-recurrence-events' else 1) for i in range(len(testingSet))]
    for i in range(len(testingSet)):
        probOf0 = 1.00
        probOf1 = 1.00
        for j in range(len(testingSet.columns)-1):
            attr = testingSet.columns[j+1]
            if testingSet.iat[i, j+1] in likelihood[attr]['no-recurrence-events']:
                probOf0 *= likelihood[attr]['no-recurrence-events'][testingSet.iat[i, j+1]]
                probOf1 *= likelihood[attr]['recurrence-events'][testingSet.iat[i, j+1]]
            else:
                probOf0 *= 1
                probOf1 *= 1
        probOf0 *= prior['no-recurrence-events']
        probOf1 *= prior['recurrence-events']
        predictedValues += [0 if probOf0 > probOf1 else 1]
    return [actualValues, predictedValues]

#Calculate sensitivity
def sensitivityMetric(actualValues, predictedValues):
    confusionMatrix = metrics.confusion_matrix(actualValues, predictedValues)
    return confusionMatrix[0][0]/(confusionMatrix[0][0] + confusionMatrix[0][1])

#Calculate recall
def specificityMetric(actualValues, predictedValues):
    confusionMatrix = metrics.confusion_matrix(actualValues, predictedValues)
    return confusionMatrix[1][1]/(confusionMatrix[1][1] + confusionMatrix[1][0])

#Create ROC Curve and save it to a file
def createROCcurve(actualValues, predictedValues):
    confusionMatrix = metrics.confusion_matrix(actualValues, predictedValues)
    fpr, tpr, thresholds = metrics.roc_curve(actualValues, predictedValues)
    roc_auc = metrics.auc(fpr, tpr)
    display = metrics.RocCurveDisplay(fpr=fpr, tpr=tpr, roc_auc=roc_auc, estimator_name="ROC Curve")
    display.plot()
    plt.show()

#Print all of the metrics
def printResults(actualValues, predictedValues, i):
    print(("Results for FOLD #{}:").format(i))
    print("Accuracy: ", round(metrics.accuracy_score(actualValues, predictedValues), 2))
    print("Sensitivity: ", round(sensitivityMetric(actualValues, predictedValues),2))
    print("Specificity: ", round(specificityMetric(actualValues, predictedValues),2))
    print("AUC: ", round(metrics.roc_auc_score(actualValues, predictedValues),2))
    print("Precision: ", round(metrics.precision_score(actualValues, predictedValues), 2))
    print("Recall: ", round(metrics.recall_score(actualValues, predictedValues), 2))
    print("F-metric: ", round(metrics.f1_score(actualValues, predictedValues), 2))
    print("Confusion Matrix: \n", metrics.confusion_matrix(actualValues, predictedValues)[0], "\n", metrics.confusion_matrix(actualValues, predictedValues)[1])
    print("----------------------------------------------------")
    createROCcurve(actualValues, predictedValues)

#MAIN
def main(csvFileName, numOfFolds):
    dataset = prepareDataset(csvFileName)
    folds = createFolds(dataset, numOfFolds)
    allActualValues = []
    allPredictedValues = []
    for i in range(numOfFolds):
        testingSet, trainingSet = assignFolds(folds, i)
        likelihood, prior = train(trainingSet)
        actualValues, predictedValues = predict(likelihood, testingSet, prior)
        printResults(actualValues, predictedValues, i+1)
        createROCcurve(actualValues, predictedValues)

main('breastCancer.csv', 5)
