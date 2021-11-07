NOTE: This is markdown file, use a Markdown viewer or editor...

## Part 1 - Simple JSON Handling
We are running a web application which stores it's configuration in a simple JSON file. Here is an example of such configuration:

```json
{
  "page1": {
    "initialSettings": {
      "coordinates": [10,12],
      "color": "white"
    },
    "available-filters": {
      "name-filter": {
        "column": "name",
        "sort": "desc"
      }
    }
  },
  "page2": {
    "initialSettings": {
      "coordinates": [14,20],
      "color": "red"
    },
    "available-filters": {
      ...
    }
  },
}
```

Your task: write a procedure/function/program that modifies arbitrary value in the configuration file on arbitrary position. The program has 2 inputs. One is the configuration file itself and second is a file which contains list of changes to be applied. The resulting json should be printed to the terminal or written to a file on disk. You can use any technology language but preferably Typescript or Python. You are allowed to use a library which parses the JSON file for you. You don't have to parse the files manually - use the best tool that you find.

#### Example:
- Configuration file:

```json
{
  "page1": {
    "initialSettings": {
      "coordinates": [10,12],
      "color": "white"
    },
    "available-filters": {
      "name-filter": {
        "column": "name",
        "sort": "desc"
      }
    }
  }
}
```

- File containing input changes in the following form:

```
"page1.initiaSettings.color": "green"
"page1.available-filters.name-filter.sort": "asc"
```

- Resulting configuration file should be:

```json
{
  "page1": {
    "initialSettings": {
      "coordinates": [10,12],
      "color": "green"
    },
    "available-filters": {
      "name-filter": {
        "column": "name",
        "sort": "asc"
      }
    }
  }
}
```

Note that the changes file should be able to handle any valid JSON structure as long as it fits in single line. For instance the following two changes should also be correctly applied:

```
"page1.initialSettings.coordinates": [24,30]
"page1.available-filters.name-filter: { "column": "lastName", "sort": "desc" }
```

## Part 2 - Handling Arrays
If your program works correctly, try to adapt it in a such way that it would allow modifications inside arrays as well. That is the system should be able to inject a JSON value inside an array on given position.

As input we will have the following JSON file:

```json
{
  "page1": {
    "initialSettings": {
      "coordinates": [
          { "value": "Wow JSON injected!!" },
           12
       ],
      "color": "green"
    },
    "available-filters": {
      "name-filter": {
        "column": "name",
        "sort": "asc"
      }
    },
    "data": [
        {
            "x": 10,
            "value": 100
        },
        {
            "x": 20,
            "value": 200
        }
    ]
  }
}
```

Bellow is the example of such change. The element at position **0** inside the **coordinates** object should be changed for the JSON value:

```
"page1.initialSettings.coordinates[0]": { "value": "Wow JSON injected!!" }
```

Which should result into the following JSON:

```json
{
  "page1": {
    "initialSettings": {
      "coordinates": [
          { "value": "Wow JSON injected!!" },
           12
       ],
      "color": "green"
    },
    // Rest of the JSON here...
}
```

Note that the indexer could appear on any level in the config (not only on the last element)

```
"page1.initialSettings.data[0].value": 400
```

Here is the part of the JSON that has been affected by the change (value has been changed to 400 on the first data point):

```json
{
   // ... First part of the JSON
    "data": [
        {
            "x": 10,
            "value": 400
        },
        {
            "x": 20,
            "value": 200
        }
    ]
  }
}
```

## Part 3 - Errors handling
The system must be as simple as possible and if it the list of transformations is long, it might be quite a challenge to know which transformation failed.

Make sure that if any of the transformations fails, the rest of the transformation still executes correctly. The system should print out in a clear way which transformations have failed and which have been applied correctly.